export interface Group {
  id: string;
  name: string;
  budget_hint: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  group_id: string;
  name: string;
  wishlist: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Assignment {
  id: string;
  group_id: string;
  giver_id: string;
  receiver_id: string;
  created_at: string;
}
