export interface ReportResponse {
  test_name: string,
  test_session_id: string,
  percentile: string,
  rank: string
}
export interface AuthContextProps {
  loggedIn: boolean;
  userId: string | null;
  userName: string;
  userDbId: number | null;
  group: string | null;
  logout: () => void;
  isLoading: boolean;
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
};

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

export interface Chapter {
  id: number;
  name: Array<{
    lang_code: string;
    chapter: string;
  }>;
  grade_id?: number | null;
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
export interface Student {
  id: number;
  student_id: string | null;
  user: User;
  stream?: string;
  grade_id?: number;
  category?: string;
}

export interface Teacher {
  id: number,
  teacher_id: string,
  user: {
    first_name: string,
    last_name: string
  }
}

export interface QuizSession {
  session: {
    batch: string,
    end_date: string,
    end_time: string,
    meta_data: {
      test_format: string,
      test_purpose: string,
      test_type: string
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

export interface GroupConfig {
  showLiveClasses: boolean;
  showTests: boolean;
  showPracticeTests: boolean;
  showHomework: boolean;
  showContentLibrary: boolean;
  showClassLibrary: boolean;
  testsSectionTitle?: string;
  homeTabLabel?: string;
  showHomeTab?: boolean;
  noTestsMessage?: string;
  noReportsMessage?: string;
}

export type GroupConfigurations = {
  [key: string]: GroupConfig;
};

export interface BottomNavigationBarProps {
  homeLabel?: string;
}