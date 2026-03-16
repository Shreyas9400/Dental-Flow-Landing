
import React from 'react';

// ChatMessage interface used for AI support chat state
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amountPaid: number;
  totalAmount: number;
}

export interface Patient {
  id: string;
  name: string;
  contact?: string;
  lastVisit: string;
  balance: number;
  status: 'active' | 'completed' | 'pending';
  paymentHistory: PaymentRecord[];
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  reason: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  purchaseDate: string;
  purchasePrice: number;
}

export interface Invoice {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: 'paid' | 'unpaid' | 'overdue';
}

export type ViewState = 'landing' | 'dashboard' | 'billing' | 'patients' | 'odontogram';

export type ToothCondition = 'healthy' | 'cavity' | 'crown' | 'rct' | 'missing';

export interface Tooth {
  id: number;
  condition: ToothCondition;
}
