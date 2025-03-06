const match = require("./match");

test('name matches to name', () => {
  expect(match()).toBe("Name Name");
});

test('name defined', () => {
    expect(match()).toBeDefined();
  });

test('name not null', () => {
    expect(match()).not.toBeNull();
});
