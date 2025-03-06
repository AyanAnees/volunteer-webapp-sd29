const match = require("../routes/match");

test('name matches to name', () => {
  expect(match()).toBe("Name Name");
});

test('name defined', () => {
    expect(match()).toBeDefined();
  });

test('name not null', () => {
    expect(match()).not.toBeNull();
});

test('name less than 100 chars', () => {
  expect(match().length).toBeLessThan(100);
});

test('name greater than 4 chars', () => {
  expect(match().length).toBeGreaterThanOrEqual(4);
});

test('name is not alphabetic', () => {
  expect(match()).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
});