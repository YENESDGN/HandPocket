export const UserRole = {
    SENDER:'sender',
    COURIER:'courier',
    ADMIN:'admin',
} as const;

export const RequestStatus = {
    PENDING:'pending',
    ACCEPTED:  'accepted',
    PICKED_UP:'picked_up',
    DELIVERED:'delivered',
    CANCELLED:'cancelled',
} as const;

export interface User {
    id: string;
    full_name: string;
    role: typeof UserRole[keyof typeof UserRole];
    email: string;
    phone_number: string;
    wallet_balance?: number;
    avarage_rating?: number;
    is_banned?: boolean;
    created_at: Date;
}

export interface DeliveryRequest {
    id: string;
    sender_id: string;
    courier_id?: string;
    package_photo_url: string;
    package_description: string;
    pickup_address: string;
    distance_km: number;
    estimated_time_mins: number;
    weight_kg: number;
    open_time_multiplier: number;
    calculated_price: number;
    status: typeof RequestStatus[keyof typeof RequestStatus];
    created_at: Date;
    updated_at: Date;
}

export interface Dispute {
    id: string;
    request_id : string;
    raised_by : string;
    reason: string;
    resolved?: boolean;
    created_at: Date;
}

export interface Transaction {
    id: string;
    request_id : string;
    review_id : string;
    reviewee_id: string;
    score: number;
    comment?: string;
    created_at?: Date;
}

export interface WalletTransaction {
    id: string;
    label: string;
    type: 'credit' | 'debit';
    amount: number;
    date: string;
}