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
export interface AxiosAdditionalHeaders {
  [key: string]: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
}

export interface GroupSession {
  session_id: number;
  group_type_id: number
}

export interface GroupUser {
  user_id: number;
  group_type_id: number
}
