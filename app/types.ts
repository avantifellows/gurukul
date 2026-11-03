export interface ReportResponse {
  test_name: string,
  test_session_id: string,
  percentile: string,
  rank: string
}
export interface AuthContextProps {
  loggedIn: boolean;
  userId: string | null;
  displayId: string | null;
  userName: string;
  group: string | null;
  studentId: string | null;
  apaarId: string | null;
  // Off the student record. The cutoffs screen reads the category so it can
  // speak to the student's own row without asking them to pick one; both are
  // undefined for teachers and for records that have never been tagged.
  studentCategory?: string;
  studentStream?: string;
  logout: () => void;
  isLoading: boolean;
  groupConfig: GroupConfig;
}

export interface CurrentTimeProps {
  className?: string;
}

export interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

export interface Report {
  test_name: string;
  rank: string;
  report_link: string;
  start_date: string;
  // Marks are not in the reports API response today — the data exists in DDB
  // (student reports v2 flow) but the Gurukul endpoint does not surface it yet.
  // The cutoffs screen reads them when they appear and simply hides its score
  // card until then, so no UI change is needed once the API starts sending them.
  marks?: number | string | null;
  total_marks?: number | string | null;
};

/**
 * The one test score the cutoffs screen speaks about: the student's most recent
 * attempt that carries marks. Null whenever no attempt has a usable score.
 */
export interface LatestScore {
  marks: number;
  totalMarks: number;
  testName: string;
  startDate: string;
}

export interface PrimaryButton {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface Curriculum {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: Array<{
    lang_code: string;
    resource: string;
  }>;
}

export interface Grade {
  id: number;
  number: number;
}

// Chapters are prioritised per curriculum, so the same chapter can be "high"
// for one exam and "low" for another. Not every chapter is tagged.
export type ChapterPriority = 'high' | 'medium' | 'low';

// One row of the chapter_curriculum join table, as returned by db-service.
// `/chapter` returns every curriculum a chapter is mapped to, not just the one
// that was requested.
export interface ChapterCurriculum {
  curriculum_id: number;
  priority?: number | null;
  priority_text?: string | null;
  weightage?: number | null;
}

export interface Chapter {
  id: number;
  name: Array<{
    lang_code: string;
    chapter: string;
  }>;
  grade_id?: number | null;
  cms_status_id?: number | null;
  // Resolved by getChapters for the curriculum that was asked for; null when
  // that curriculum has no priority recorded for the chapter.
  priority?: ChapterPriority | null;
}

export interface Resource {
  id: number;
  name: Array<{
    lang_code: string;
    resource: string;
  }>;
  topic_id: number;
  source_id: number;
  tag_ids: number[];
  link: string;
  chapter_id: number;
  type: string;
  subtype: string;
  type_params: {
    date: string,
    resource_type: string;
    src_link?: string;
  },
  source: {
    link: string;
  }
}

export interface Topic {
  id: number;
  name: Array<{
    lang_code: string;
    resource: string;
  }>;
  chapter_id: number;
}

export interface Session {
  id: number;
  name: string;
  platform: string;
  platform_link: string;
  meta_data: {
    subject: string;
    batch: string;
    stream: string;
    test_type: string;
    hide_in_gurukul?: boolean;
  };
  start_time: string;
  end_time: string;
  is_active: boolean;
  repeat_schedule: {
    type: string;
    params: Object[];
  },
  session_id: string;
}

export interface ReportsListProps {
  userId: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  gender?: string;
}

export interface UserDetails {
  user: User;
  student?: Student | null;
}

export interface Student {
  id: number;
  student_id: string | null;
  user: User;
  stream?: string;
  grade_id?: number;
  category?: string;
}

export type TokenProfile = {
  user?: any;
  student?: any;
  teacher?: any;
  candidate?: any;
  school?: any;
};

// Portal tokens may include teacher/candidate/school sections too. Gurukul only
// consumes user and student fields today, so the extra sections are ignored.
export type ResolvedTokenIdentity = {
  userId: string | null;
  group: string | null;
  displayId: string | null;
  studentId: string | null;
  apaarId: string | null;
  profile: TokenProfile | null;
};

export interface Teacher {
  id: number,
  teacher_id: string,
  user: {
    first_name: string,
    last_name: string
  }
}

export interface QuizSession {
  // Occurrence-level window for this instance. session.end_time is the schedule
  // SPAN end (multi-day for weekly); this is *today's* slot end. Optional because
  // some legacy/non-occurrence shapes only carry the nested session.
  end_time?: string,
  start_time?: string,
  session: {
    batch: string,
    end_date: string,
    end_time: string,
    meta_data: {
      test_format: string,
      test_purpose: string,
      test_type: string,
      hide_in_gurukul?: boolean
    }
    start_date: string,
    start_time: string,
    name: string,
    subject: string,
    id: string,
    platform_id: string,
  },
}

export interface SessionOccurrence {
  id: number,
  session_id: number,
  start_time: string,
  end_time: string,
  batch_id: number,
  session: Session
}

export interface MessageDisplayProps {
  message: string;
}

export interface QuizCompletionStatus {
  [key: string]: boolean;
}

/**
 * A tile in the homepage "Resources" section (design Option B). Each links to a
 * study resource — a library view, an external tool, a handbook, etc. The list
 * is supplied per group via GroupConfig, so content/product controls what shows
 * where without a code change.
 */
export interface ResourceTile {
  title: string;
  subtitle?: string;
  href: string;
  // true opens href in a new tab (external tools); omit for in-app navigation.
  external?: boolean;
  // Icon shown in the tile's leading chip; falls back to a generic list icon.
  icon?: 'list' | 'compass' | 'book' | 'target';
}

export interface GroupConfig {
  showLiveClasses: boolean;
  showTests: boolean;
  showForms: boolean;
  showPracticeTests: boolean;
  showHomework: boolean;
  showContentLibrary: boolean;
  showClassLibrary: boolean;
  /**
   * Controls which sponsor logos appear on the authenticated homepage footer strip.
   * - `default`: show current "powered by" + "supported by"
   * - `capgeminiOnly`: show only Capgemini logo centered
   */
  homepageSponsorLogos?: 'default' | 'capgeminiOnly';
  testsSectionTitle?: string;
  homeTabLabel?: string;
  showHomeTab?: boolean;
  showLibraryTab?: boolean;
  showReportsTab?: boolean;
  noTestsMessage?: string;
  noReportsMessage?: string;
  testsInfoLink?: string;
  testsHeaderNote?: string;
  displayLabel?: string;
  /**
   * Auth group the login-page button logs into, when it differs from
   * this entry's key (e.g. JNV CoE/Nodal buttons log in as EnableStudents).
   */
  portalGroup?: string;
  region?: string;
  // Homepage "Resources" section (Option B). Hidden unless showResources is
  // true and resources has at least one tile.
  showResources?: boolean;
  resources?: ResourceTile[];
}

export type GroupConfigurations = {
  [key: string]: GroupConfig;
};

export interface BottomNavigationBarProps {
  homeLabel?: string;
}

/**
 * The five reservation categories the cutoff sheets are published against.
 * Student records carry free text ("General", "OBC", "obc-ncl"), so it is
 * normalised onto this set before anything is matched against it.
 */
export type CutoffCategory = 'Open' | 'EWS' | 'OBC-NCL' | 'SC' | 'ST';

/**
 * One rung of the ladder an exam's cutoffs describe, in ascending order of
 * marks. The student-facing name and description are the only wording that
 * reaches the screen — the internal M1a/M1b/M2 labels stay out of the product.
 *
 * The statement copy is the test reports' own, word for word, so a student
 * reads the same sentence in Gurukul and in their report.
 */
export interface CutoffTarget {
  key: string;
  // Column header in the full table; kept short enough for a phone.
  columnLabel: string;
  // Heading in the "What these mean" card.
  name: string;
  description: string;
  // Shown when the student has not reached even this, the lowest target.
  // "{marks}" is replaced with how many marks short they are.
  belowHeadline?: string;
  // Shown when this is the highest target the student has reached.
  reachedHeadline: string;
  // Named in the "Your next target: N more marks for ___." line while the
  // student is still below this target. Omit on the top target.
  nextTargetLabel?: string;
}

/** One category's marks, keyed by CutoffTarget.key. */
export interface CutoffRow {
  category: CutoffCategory;
  marks: Record<string, number>;
}

/**
 * Everything the cutoffs screen needs for one exam. Adding NEET, JEE Advanced
 * or a state CET is a new entry in cutoffConfig — no code change — and the
 * screen grows an exam switcher as soon as a second exam applies to a student.
 */
export interface ExamCutoffs {
  id: string;
  // Full name, used in headings and in the statement copy.
  name: string;
  // Label on the exam switcher, where space is tight.
  shortName: string;
  maxMarks: number;
  // e.g. "2026 cycle" — names the admission cycle the marks belong to.
  cycleLabel: string;
  // One line under the score statement, crediting where the marks come from.
  sourceNote: string;
  // One line under the full table, restating the scale and the source.
  tableNote: string;
  // Student streams this exam applies to, lower-cased. Omit to offer the exam
  // to every student, whatever their record says.
  streams?: string[];
  // Ascending by marks: the screen reads them as steps up a ladder.
  targets: CutoffTarget[];
  cutoffs: CutoffRow[];
}

/**
 * What the score card says about one student: the headline sentence and, when
 * there is a rung left to climb, the next-target line under it.
 */
export interface CutoffStatement {
  headline: string;
  nextTarget: string | null;
  // Index of the highest target reached, -1 when below the first one. The
  // screen does not render it; tests assert on it.
  reachedIndex: number;
}
