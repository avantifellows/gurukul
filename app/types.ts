export interface ReportResponse {
  test_name: string,
  test_session_id: string,
  percentile: string,
  rank: string
}
export interface AuthContextProps {
  loggedIn: boolean;
  userId?: string | null;
  userName?: string | null;
  userDbId?: number | null;
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
  name: string;
}

export interface Grade {
  id: number;
  number: number;
}

export interface Chapter {
  id: number;
  name: string;
}

export interface Resource {
  id: number;
  name: string;
  topic_id: number;
  source_id: number;
  link: string;
  chapter_id: number;
  type: string;
  type_params: {
    date: string
  }
}

export interface Topic {
  id: number;
  name: string;
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
}
export interface Student {
  id: number;
  student_id: string;
  user: User;
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
      test_format: string
    }
    start_date: string,
    start_time: string,
    name: string,
    subject: string,
    id: string,
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

// Add these to your existing types.ts file
export interface GroupUser {
  group_id: string;
  // Add other properties as needed
}

export interface Group {
  id: string;
  type: string;
  child_id: string;
  // Add other properties as needed
}

export interface AuthGroup {
  id: string;
  name: string;
}
