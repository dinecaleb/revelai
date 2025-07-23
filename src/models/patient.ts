export interface PatientContext {
    id: string;
    age: number;
    language: 'en' | 'es';
    condition: 'hip_replacement' | 'knee_replacement';
}
