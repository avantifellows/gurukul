import { describe, expect, it } from 'vitest';
import { toLaunchPath } from './launchPath';

describe('toLaunchPath', () => {
    it('drops the trailing user_id so the launch token becomes the identity', () => {
        expect(toLaunchPath('/reports/student_quiz_report/S1/U1')).toBe(
            '/reports/student_quiz_report/S1'
        );
    });

    it('handles the /v3 variant and a trailing slash', () => {
        expect(toLaunchPath('/reports/student_quiz_report/v3/S1/U1')).toBe(
            '/reports/student_quiz_report/v3/S1'
        );
        expect(toLaunchPath('/reports/student_quiz_report/S1/U1/')).toBe(
            '/reports/student_quiz_report/S1'
        );
    });

    // Anything that is not a {session}/{user} report path must return null so
    // the route 400s instead of redirecting somewhere unintended.
    it('rejects paths it should not rewrite', () => {
        expect(toLaunchPath('/reports/student_quiz_report/S1')).toBeNull();
        expect(toLaunchPath('/reports/some_other_report/S1/U1')).toBeNull();
        expect(toLaunchPath('/reports/student_quiz_report//U1')).toBeNull();
    });
});
