import { describe, expect, it } from 'vitest';
import type { ResourceTile } from '@/app/types';
import { buildResourceTiles, defaultMentorshipGrade, isMentorshipEnabled, MENTORSHIP_GRADES } from './mentorshipSupport';

const handbook: ResourceTile = { title: 'Student Handbook', subtitle: 'Rules, schedule and FAQs', href: 'https://example.org/handbook', external: true, icon: 'book' };
const futures: ResourceTile = { title: 'Futures Tool', href: 'https://example.org/futures', external: true, icon: 'compass' };

describe('buildResourceTiles', () => {
    it('leaves a program without the switch exactly as it was', () => {
        expect(buildResourceTiles({ showResources: true }, [futures, handbook])).toEqual([futures, handbook]);
        expect(buildResourceTiles({ showResources: false }, [futures, handbook])).toEqual([]);
        expect(buildResourceTiles({}, [futures])).toEqual([]);
    });

    it('treats anything but true as off', () => {
        expect(buildResourceTiles({ showResources: true, showMentorshipSupport: false }, [handbook])).toEqual([handbook]);
    });

    it('adds Mentorship Support as the last tile for the switched-on program', () => {
        const tiles = buildResourceTiles({ showResources: true, showMentorshipSupport: true }, [futures, handbook]);
        expect(tiles.map((t) => t.title)).toEqual(['Futures Tool', 'Student Handbook', 'Mentorship Support']);
        expect(tiles[2]).toMatchObject({ href: '/mentorship', badge: 'For your program', subtitle: 'Know how your mentor can support you' });
    });

    it('still shows the tile when the program has no other resources', () => {
        expect(buildResourceTiles({ showResources: false, showMentorshipSupport: true }, [handbook]).map((t) => t.title))
            .toEqual(['Mentorship Support']);
    });
});

describe('isMentorshipEnabled', () => {
    it('is on only for an explicit true', () => {
        expect(isMentorshipEnabled({ showMentorshipSupport: true })).toBe(true);
        expect(isMentorshipEnabled({ showMentorshipSupport: false })).toBe(false);
        expect(isMentorshipEnabled({})).toBe(false);
    });
});

describe('MENTORSHIP_GRADES', () => {
    it('has the approved counts per grade and no bracketed placeholders', () => {
        expect(MENTORSHIP_GRADES.map((g) => [g.grade, g.help.length, g.expect.length])).toEqual([[12, 13, 4], [13, 14, 4]]);
        const text = MENTORSHIP_GRADES.flatMap((g) => [...g.help, ...g.expect]).map((i) => `${i.title} ${i.body}`).join('\n');
        expect(text).not.toContain('[');
        expect(text).toContain('Your mentor will talk to you every 2 weeks.');
    });
});

describe('defaultMentorshipGrade', () => {
    it('opens droppers on their own option and everyone else on Class 12', () => {
        expect(defaultMentorshipGrade(5)).toBe(13);
        expect(defaultMentorshipGrade(4)).toBe(12);
        expect(defaultMentorshipGrade(3)).toBe(12);
        expect(defaultMentorshipGrade(undefined)).toBe(12);
        expect(defaultMentorshipGrade(null)).toBe(12);
    });

    it('labels the options the way students describe themselves', () => {
        expect(MENTORSHIP_GRADES.map((g) => g.label)).toEqual(['Class 12', 'Dropper']);
    });
});
