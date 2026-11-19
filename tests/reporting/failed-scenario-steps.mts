import { EventEmitter } from 'node:events';
import { styleText } from 'node:util';
import { Status, formatterHelpers } from '@cucumber/cucumber';
import type { ITestStepHookParameter } from '@cucumber/cucumber';
import type { Plugin } from '@cucumber/cucumber/api';

const { EventDataCollector, GherkinDocumentParser, PickleParser, isFailure } = formatterHelpers;

export function formatStepStatus(status: ITestStepHookParameter['result']['status'], color?: boolean): string {
  const label = status === Status.PASSED ? 'PASS' : status;
  if (color === false) return label;

  const options = { validateStream: color === undefined };
  switch (status) {
    case Status.PASSED: return styleText('green', label, options);
    case Status.FAILED: return styleText('red', label, options);
    case Status.SKIPPED: return styleText('yellow', label, options);
    default: return label;
  }
}

const failedScenarioSteps: Plugin = {
  type: 'plugin',
  coordinator({ environment, on }) {
    if (environment.env.SHOW_GHERKIN_PROGRESS?.toLowerCase() === 'false') return;

    const events = new EventEmitter();
    const collector = new EventDataCollector(events);
    const definitionLocations = new Map<string, string>();

    on('message', envelope => {
      if (envelope.stepDefinition) {
        const { id, sourceReference } = envelope.stepDefinition;
        if (sourceReference.uri && sourceReference.location) {
          definitionLocations.set(id, `${sourceReference.uri}:${sourceReference.location.line}`);
        }
        return;
      }
      if (envelope.attachment) return;
      events.emit('envelope', envelope);
      if (!envelope.testRunFinished) return;

      const failures = collector.getTestCaseAttempts()
        .filter(attempt => !attempt.willBeRetried && isFailure(attempt.worstTestStepResult));
      if (failures.length === 0) return;

      const lines = ['', 'Steps in failed scenarios:'];
      for (const { gherkinDocument, pickle, testCase, stepResults } of failures) {
        const { line } = PickleParser.getPickleLocation({ gherkinDocument, pickle });
        lines.push('', `  ${pickle.name} # ${pickle.uri}:${line}`);
        const gherkinStepMap = GherkinDocumentParser.getGherkinStepMap(gherkinDocument);
        const pickleSteps = PickleParser.getPickleStepMap(pickle);

        for (const { id, pickleStepId, stepDefinitionIds } of testCase.testSteps) {
          if (!pickleStepId) continue;
          const pickleStep = pickleSteps[pickleStepId];
          const keyword = PickleParser.getStepKeyword({ pickleStep, gherkinStepMap }).trim();
          const { status, exception, message } = stepResults[id];
          const label = formatStepStatus(status);
          if (status === Status.FAILED) {
            const location = definitionLocations.get(stepDefinitionIds?.[0] ?? '');
            const source = location ? ` # ${location}` : '';
            lines.push(`    ${label} · ${keyword} ${pickleStep.text}${source}`);
            const diagnostic = exception?.stackTrace || exception?.message || message;
            if (diagnostic) {
              for (const line of diagnostic.trimEnd().split(/\r?\n/)) {
                lines.push(line ? `        ${line}` : '');
              }
            }
          } else {
            lines.push(`    ${label} · ${keyword} ${pickleStep.text}`);
          }
        }
      }
      process.stdout.write(`${lines.join('\n')}\n\n`);
    });
  }
};

export default failedScenarioSteps;
