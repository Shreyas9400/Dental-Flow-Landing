
import React from 'react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewState = 'landing' | 'dashboard' | 'billing' | 'patients' | 'odontogram';

export interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  balance: number;
  status: 'active' | 'completed' | 'pending';
}

export interface Invoice {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: 'paid' | 'unpaid' | 'overdue';
}

export type ToothCondition = 'healthy' | 'cavity' | 'crown' | 'rct' | 'missing';

export interface Tooth {
  id: number;
  condition: ToothCondition;
}
