import { InMemoryConnector } from '../src/index';

describe('InMemoryConnector', () => {
  test('should CRUD students, tutors, and chats', async () => {
    const db = new InMemoryConnector();
    // initial empty
    expect((await db.getAll()).students.length).toBe(0);

    // upsert student
    await db.upsertStudent({ id: 's1', tutors: [] } as any);
    expect((await db.listStudents()).length).toBe(1);

    // upsert tutor
    await db.upsertTutor('s1', { id: 't1', name: 'Tutor', subject: { id: 'sub', name: 'n', topic: '' }, chats: [] } as any);
    expect((await db.listTutors('s1')).length).toBe(1);

    // append chats
    await db.appendChat('s1', 't1', { message: 'hi', isReply: false, timestamp: 1 });
    await db.appendChat('s1', 't1', { message: 'hello', isReply: true, timestamp: 2 });
    const chats1 = await db.listChats('s1', 't1');
    expect(chats1.length).toBe(2);

    // replace chats
    await db.replaceChats('s1', 't1', [{ message: 'only', isReply: false, timestamp: 3 }]);
    const chats2 = await db.listChats('s1', 't1');
    expect(chats2.length).toBe(1);
    expect(chats2[0].message).toBe('only');

    // delete tutor
    await db.deleteTutor('s1', 't1');
    expect((await db.listTutors('s1')).length).toBe(0);

    // delete student
    await db.deleteStudent('s1');
    expect((await db.listStudents()).length).toBe(0);
  });
});


