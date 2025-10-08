import { SessionStorageSchema, StorageConnector, SessionStudent, SessionTutor, SessionChat } from '../types';

export class InMemoryConnector implements StorageConnector {
  private db: SessionStorageSchema = { students: [] };

  async getAll(): Promise<SessionStorageSchema> {
    return JSON.parse(JSON.stringify(this.db));
  }

  async setAll(schema: SessionStorageSchema): Promise<void> {
    this.db = JSON.parse(JSON.stringify(schema));
  }

  async listStudents(): Promise<SessionStudent[]> {
    return this.db.students;
  }

  async upsertStudent(student: SessionStudent): Promise<void> {
    const idx = this.db.students.findIndex(s => s.id === student.id);
    if (idx >= 0) this.db.students[idx] = student; else this.db.students.push(student);
  }

  async deleteStudent(studentId: string): Promise<void> {
    this.db.students = this.db.students.filter(s => s.id !== studentId);
  }

  async listTutors(studentId: string): Promise<SessionTutor[]> {
    const s = this.db.students.find(x => x.id === studentId);
    return s?.tutors || [];
  }

  async upsertTutor(studentId: string, tutor: SessionTutor): Promise<void> {
    let s = this.db.students.find(x => x.id === studentId);
    if (!s) {
      s = { id: studentId, tutors: [] };
      this.db.students.push(s);
    }
    const idx = s.tutors.findIndex(t => t.id === tutor.id);
    if (idx >= 0) s.tutors[idx] = { ...s.tutors[idx], ...tutor }; else s.tutors.push(tutor);
  }

  async deleteTutor(studentId: string, tutorId: string): Promise<void> {
    const s = this.db.students.find(x => x.id === studentId);
    if (!s) return;
    s.tutors = s.tutors.filter(t => t.id !== tutorId);
  }

  async listChats(studentId: string, tutorId: string): Promise<SessionChat[]> {
    const tutors = await this.listTutors(studentId);
    const t = tutors.find(x => x.id === tutorId);
    return t?.chats || [];
  }

  async appendChat(studentId: string, tutorId: string, chat: SessionChat): Promise<void> {
    let s = this.db.students.find(x => x.id === studentId);
    if (!s) {
      s = { id: studentId, tutors: [] };
      this.db.students.push(s);
    }
    let t = s.tutors.find(x => x.id === tutorId);
    if (!t) {
      t = { id: tutorId, name: tutorId, subject: { id: 'unknown', name: 'unknown', topic: '' }, chats: [] };
      s.tutors.push(t);
    }
    t.chats.push(chat);
  }

  async replaceChats(studentId: string, tutorId: string, chats: SessionChat[]): Promise<void> {
    let s = this.db.students.find(x => x.id === studentId);
    if (!s) {
      s = { id: studentId, tutors: [] };
      this.db.students.push(s);
    }
    let t = s.tutors.find(x => x.id === tutorId);
    if (!t) {
      t = { id: tutorId, name: tutorId, subject: { id: 'unknown', name: 'unknown', topic: '' }, chats: [] };
      s.tutors.push(t);
    }
    t.chats = chats;
  }
}

export default InMemoryConnector;


