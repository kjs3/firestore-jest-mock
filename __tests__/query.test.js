const {
  mockCollection,
  mockGet,
  mockWhere,
  mockOffset,
  FakeFirestore,
} = require('../mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');

describe('test', () => {
  mockFirebase({
    database: {
      animals: [
        { id: 'monkey', name: 'monkey', type: 'mammal' },
        { id: 'elephant', name: 'elephant', type: 'mammal' },
        { id: 'chicken', name: 'chicken', type: 'bird' },
        { id: 'ant', name: 'ant', type: 'insect' },
      ],
    },
    currentUser: { uid: 'homer-user' },
  });
  const firebase = require('firebase');
  firebase.initializeApp({
    apiKey: '### FIREBASE API KEY ###',
    authDomain: '### FIREBASE AUTH DOMAIN ###',
    projectId: '### CLOUD FIRESTORE PROJECT ID ###',
  });

  const db = firebase.firestore();

  test('It can query firestore', async () => {
    const animals = await db
      .collection('animals')
      .where('type', '==', 'mammal')
      .get();

    expect(animals).toHaveProperty('docs', expect.any(Array));
    expect(mockWhere).toHaveBeenCalledWith('type', '==', 'mammal');
    expect(mockCollection).toHaveBeenCalledWith('animals');
    expect(mockGet).toHaveBeenCalled();
  });

  test('it returns a Query from query methods', () => {
    const ref = db.collection('animals');
    expect(ref.where('type', '==', 'mammal')).toBeInstanceOf(FakeFirestore.Query);
    expect(ref.limit(1)).toBeInstanceOf(FakeFirestore.Query);
    expect(ref.orderBy('type')).toBeInstanceOf(FakeFirestore.Query);
    expect(ref.startAfter(null)).toBeInstanceOf(FakeFirestore.Query);
    expect(ref.startAt(null)).toBeInstanceOf(FakeFirestore.Query);
  });

  test('it permits mocking the results of a where clause', async () => {
    expect.assertions(2);
    const ref = db.collection('animals');

    let result = await ref.where('type', '==', 'mammal').get();
    expect(result.docs.length).toBe(4);

    // There's got to be a better way to mock like this, but at least it works.
    mockWhere.mockReturnValueOnce({
      get() {
        return Promise.resolve({
          docs: [
            { id: 'monkey', name: 'monkey', type: 'mammal' },
            { id: 'elephant', name: 'elephant', type: 'mammal' },
          ],
        });
      },
    });
    result = await ref.where('type', '==', 'mammal').get();
    expect(result.docs.length).toBe(2);
  });

  test('It can offset query', async () => {
    const firstTwoMammals = await db
      .collection('animals')
      .where('type', '==', 'mammal')
      .offset(2)
      .get();

    expect(firstTwoMammals).toHaveProperty('docs', expect.any(Array));
    expect(mockWhere).toHaveBeenCalledWith('type', '==', 'mammal');
    expect(mockCollection).toHaveBeenCalledWith('animals');
    expect(mockGet).toHaveBeenCalled();
    expect(mockOffset).toHaveBeenCalledWith(2);
  });
});
