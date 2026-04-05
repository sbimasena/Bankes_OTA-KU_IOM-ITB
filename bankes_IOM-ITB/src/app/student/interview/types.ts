export interface InterviewParticipant {
  id: number;
  userId: string;
  User: {
    name: string;
  };
}

export interface InterviewSlot {
  id: number;
  title: string | null;
  description: string | null;
  startTime: string;
  endTime: string;
  createdById: string;
  studentId: string | null;
  bookedAt?: string | null;
  User: {
    name: string;
  };
  Participants: InterviewParticipant[];
  Student?: {
    User: {
      name: string;
    };
  };
}

export interface IOMStaff {
  id: string;
  name: string;
  email: string;
}
