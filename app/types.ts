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
}

export interface Topic {
  id: number;
  name: string;
  chapter_id: number;
}

export interface SessionOccurrence {
  id: number;
  name: string;
  session_id: string;
  session_fk: number;
  start_time: string;
  end_time: string;
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
}

export interface LiveClasses {
  sessionOccurrence: SessionOccurrence;
  sessionDetail: Session;
}

