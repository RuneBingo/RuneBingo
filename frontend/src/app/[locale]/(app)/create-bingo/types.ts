export type FormValues = {
  language: string;
  title: string;
  description: string;
  private: boolean;
  startDate: string;
  endDate: string;
  maxRegistrationDate: string;
  width: number | null;
  height: number | null;
  fullLineValue: number | null;
};

export type Step = 'details' | 'dates' | 'card';
