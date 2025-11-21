export interface Problem {
  id: string;
  title: string;
  description: string;
  initialCode: string;
  testCases?: TestCase[];
}

export interface TestCase {
  input?: string;
  expectedOutput: string;
}
