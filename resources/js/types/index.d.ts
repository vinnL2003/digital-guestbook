export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'operator';
    is_active: boolean;
    email_verified_at?: string;
    created_at?: string;
}

export interface Division {
    id: number;
    division_name: string;
    pic_name?: string | null;
    room_location?: string | null;
    is_active: boolean;
    visits_count?: number;
    created_at?: string;
}

export interface VisitMember {
    id: number;
    visit_id: number;
    name: string;
    signature_base64: string;
    is_leader: boolean;
    created_at?: string;
}

export interface Visit {
    id: number;
    ticket_code: string;
    visitor_name: string;
    institution: string;
    phone_number: string;
    division_id: number;
    destination_person?: string | null;
    visitor_count: number;
    purpose: string;
    signature_base64: string;
    status: 'checked_in' | 'checked_out';
    check_in_time: string;
    slot_time?: string | null;
    check_out_time?: string | null;
    checked_out_by?: number | null;
    division?: Division;
    members?: VisitMember[];
    checked_out_by_user?: User | null;
    created_at?: string;
}

export interface SiteSetting {
    id: number;
    organization_name: string;
    welcome_title: string;
    welcome_subtitle?: string | null;
    logo_url?: string | null;
    announcement_text?: string | null;
    security_induction_title?: string | null;
    security_induction_content?: string | null;
    is_security_induction_active?: boolean;
    updated_at?: string;
}

export type PageProps<
    T = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
        info?: string | null;
    };
};
