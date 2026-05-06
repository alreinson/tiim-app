export type Language = 'et' | 'en'

export type UserRole = 'team_member' | 'manager' | 'admin'

export type GoalLevel = 'yearly' | 'quarterly'
export type GoalType = 'work' | 'development'
export type GoalStatus = 'not_started' | 'in_progress' | 'on_track' | 'at_risk' | 'done'

export type WorkItemType = 'project' | 'task'
export type WorkItemStatus = GoalStatus

export type SupportType = 'feel_heard' | 'want_solution' | 'think_through'

export type CheckinType = 'weekly' | 'quarterly'

export interface User {
  id: string
  clerk_id: string
  email: string
  name: string
  role: UserRole
  company_id: string
  manager_id?: string
  language: Language
  support_style: number   // 1 (solutions) – 5 (feel heard)
  feedback_directness: 'direct' | 'balanced' | 'gentle'
  timezone: string
  vacation_mode: boolean
  belbin_uploaded: boolean
  onboarding_complete: boolean
  created_at: string
}

export interface Company {
  id: string
  name: string
  created_at: string
}

export interface Goal {
  id: string
  company_id: string
  title: string
  level: GoalLevel
  type: GoalType
  status: GoalStatus
  progress: number        // 0–100
  parent_id?: string      // quarterly → yearly
  owner_id?: string
  contributor_ids: string[]
  quarter?: string        // e.g. "Q2-2026"
  year?: number
  created_at: string
  updated_at: string
}

export interface WorkItem {
  id: string
  company_id: string
  title: string
  type: WorkItemType
  status: WorkItemStatus
  goal_ids: string[]
  owner_id: string
  created_at: string
  updated_at: string
}

export interface CheckinSharing {
  progress: number[]
  plans: number[]
  problems: number[]
}

export interface Checkin {
  id: string
  user_id: string
  type: CheckinType
  week: string            // ISO week string e.g. "2026-W19"
  transcript: string
  progress: string[]
  plans: string[]
  problems: string[]
  sharing: CheckinSharing
  mood?: number           // 1–5
  energy?: number         // 1–5
  workload?: number       // 1–5
  approved: boolean
  approved_at?: string
  created_at: string
}

export interface Blocker {
  id: string
  user_id: string
  company_id: string
  summary: string
  support_type: SupportType
  resolved: boolean
  resolved_at?: string
  manager_response?: string
  created_at: string
}

export interface Shoutout {
  id: string
  from_user_id: string
  to_user_id: string
  company_id: string
  message: string
  anonymous: boolean
  created_at: string
}

export interface NewsItem {
  id: string
  author_id: string
  company_id: string
  content: string
  pinned: boolean
  created_at: string
}

export interface BelbinRole {
  code: 'PL' | 'RI' | 'CO' | 'SH' | 'ME' | 'TW' | 'IMP' | 'CF' | 'SP'
  score: number
}

export interface BelbinProfile {
  id: string
  user_id: string
  primary_roles: BelbinRole[]
  secondary_roles: BelbinRole[]
  weak_roles: BelbinRole[]
  uploaded_at: string
}

export interface GoalIndexItem {
  id: string
  level: 'yearly' | 'quarterly' | 'project' | 'task'
  type: string
  title: string
  parent_id?: string
  goal_ids?: string[]
  status: string
}

export type GoalIndex = GoalIndexItem[]
