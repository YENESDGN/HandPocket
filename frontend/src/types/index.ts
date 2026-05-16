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
    COMPLETED:'completed',
    DISPUTED:'disputed',
    CANCELLED:'cancelled',
} as const;

export interface User {
    id: string;
    full_name: string;
    role: typeof UserRole[keyof typeof UserRole];
    email: string;
    phone_number: string;
    wallet_balance?: number;
    average_rating?: number;
    is_banned?: boolean;
    created_at: Date;
    avatar_url?: string;
}

export interface DeliveryRequest {
    id: string;
    sender_id: string;
    courier_id?: string;
    package_photo_url: string;
    package_description: string;
    pickup_address: string;
    delivery_address: string;
    distance_km: number;
    estimated_time_mins: number;
    weight_kg: number;
    open_time_multiplier: number;
    calculated_price: number;
    status: typeof RequestStatus[keyof typeof RequestStatus];
    delivery_proof_photo_url?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Dispute {
    id: string;
    request_id: string;
    raised_by: string;
    reason: string;
    resolved: boolean;
    created_at: string;
}

export interface Review {
    id: string;
    request_id: string;
    reviewer_id: string;
    reviewee_id: string;
    score: number;
    comment?: string;
    created_at: string;
}

export interface WalletTransaction {
    id: string;
    label: string;
    type: 'credit' | 'debit';
    amount: number;
    date: string;
}

export interface WalletStats {
    total_spent: number;
    total_deliveries: number;
    avg_order: number;
}

export interface WalletSummary {
    balance: number;
    stats: WalletStats;
    transactions: WalletTransaction[];
}