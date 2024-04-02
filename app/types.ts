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
  }
}

export interface ReportsListProps {
  userId: string;

}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
}

export interface GroupSession {
  session_id: number;
  group_id: number
}

export interface GroupUser {
  user_id: number;
  group_id: number
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
  batch: string,
  end_date: string,
  end_time: string,
  redirectPlatformParams: {
    id: string
  }
  start_date: string,
  start_time: string,
  name: string,
  subject: string,
  redirectPlatform: string,
  stream: string,
  id: string,
  testFormat: string
}

export interface SessionSchedule {
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
