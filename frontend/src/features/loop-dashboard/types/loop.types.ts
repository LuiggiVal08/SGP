export interface LoopStory {
  id: string;
  title: string;
  epic: string;
  status: string;
  hardRule: boolean;
}

export interface LoopState {
  storyId: string;
  status: string;
  testsPassedBefore: number;
  testsPassedAfter: number;
  lastCommit: string | null;
  halted: boolean;
  haltReason: string | null;
}

export interface LoopReceipt {
  story: string;
  date: string;
  haltReason: string;
  testsBefore: string;
  testsAfter: string;
  cost: string;
  commit: string;
  checker: string;
  escalado: string;
}

export interface LoopSnapshot {
  backlog: LoopStory[];
  state: LoopState | null;
  receipts: LoopReceipt[];
  generatedAt: string;
}
