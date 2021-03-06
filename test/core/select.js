const path = require('path');
const {test, assert} = require('scar');

const to_arr = x => Array.from(x);

const fQuery = require('../../lib/fQuery');


test('fQuery.fn.select() is function', () => {
    assert.equal(typeof fQuery.fn.select, 'function');
});

test('fQuery.fn.select() expectes 2 parameter', () => {
    assert.equal(fQuery.fn.select.length, 2);
});

test('fQuery.fn.select() works with no parameter', () => {
    fQuery().select();
    fQuery().select(undefined);
    fQuery().select(null);
});

test('fQuery.fn.select() returns this, is chainable', () => {
    const x = fQuery();
    const y = x.select();
    const z = y.select();
    assert.equal(x, y);
    assert.equal(y, z);
});

test('fQuery.fn.select() empty select 1', () => {
    const x = fQuery();
    assert.deep_equal(x._stack, [[]]);
    assert.deep_equal(to_arr(x), []);
    assert.equal(x.length, 0);
});

test('fQuery.fn.select() empty select 2', () => {
    const x = fQuery().select();
    assert.deep_equal(x._stack, [[], []]);
    assert.deep_equal(to_arr(x), []);
    assert.equal(x.length, 0);
});

test('fQuery.fn.select() empty select 3', () => {
    const x = fQuery().select().select();
    assert.deep_equal(x._stack, [[], [], []]);
    assert.deep_equal(to_arr(x), []);
    assert.equal(x.length, 0);
});

test('fQuery.fn.select() non blob select', () => {
    const v = {};
    const x = fQuery().select(v);
    assert.deep_equal(x._stack, [[], []]);
    assert.deep_equal(to_arr(x), []);
    assert.equal(x.length, 0);
});

test('fQuery.fn.select() non blob array select', () => {
    const v = [{}, 1, true, null, undefined, 'text'];
    const x = fQuery().select(v);
    assert.deep_equal(x._stack, [[], []]);
    assert.deep_equal(to_arr(x), []);
    assert.equal(x.length, 0);
});

test('fQuery.fn.select() blob select', () => {
    const b = fQuery.Blob.fromPath('test/assets/files-abc/a');
    const x = fQuery().select(b);
    assert.deep_equal(x._stack, [[b], []]);
    assert.deep_equal(to_arr(x), [b]);
    assert.equal(x.length, 1);
});

test('fQuery.fn.select() blob array select', () => {
    const b1 = fQuery.Blob.fromPath('test/assets/files-abc/a');
    const b2 = fQuery.Blob.fromPath('test/assets/files-abc/b');
    const b3 = fQuery.Blob.fromPath('test/assets/files-abc/c');
    const x = fQuery().select([b1, b2, b3]);
    assert.deep_equal(x._stack, [[b1, b2, b3], []]);
    assert.deep_equal(to_arr(x), [b1, b2, b3]);
    assert.equal(x.length, 3);
});

test('fQuery.fn.select() mixed array select', () => {
    const b1 = fQuery.Blob.fromPath('test/assets/files-abc/a');
    const b2 = fQuery.Blob.fromPath('test/assets/files-abc/b');
    const b3 = fQuery.Blob.fromPath('test/assets/files-abc/c');
    const x = fQuery().select([b1, 1, b2, true, b3, null]);
    assert.deep_equal(x._stack, [[b1, b2, b3], []]);
    assert.deep_equal(to_arr(x), [b1, b2, b3]);
    assert.equal(x.length, 3);
});

test('fQuery.fn.select() multi blob array select', () => {
    const b1 = fQuery.Blob.fromPath('test/assets/files-abc/a');
    const b2 = fQuery.Blob.fromPath('test/assets/files-abc/b');
    const b3 = fQuery.Blob.fromPath('test/assets/files-abc/c');
    const x = fQuery().select([b1, b2, b3]).select([b1]).select(b3);
    assert.deep_equal(x._stack, [[b3], [b1], [b1, b2, b3], []]);
    assert.deep_equal(to_arr(x), [b3]);
    assert.equal(x.length, 1);
});

test('fQuery.fn.select() string select', () => {
    const x = fQuery().select('test/assets/files-abc/a');
    const sources = Array.from(x, xi => xi.source);
    const expected = [path.resolve('test/assets/files-abc/a')];
    assert.deep_equal(sources, expected);
});

test('fQuery.fn.select() string select glob', () => {
    const x = fQuery().select('test/assets/files-abc/*');
    const sources = Array.from(x, xi => xi.source);
    const expected = [path.resolve('test/assets/files-abc/a'), path.resolve('test/assets/files-abc/b'), path.resolve('test/assets/files-abc/c')];
    assert.deep_equal(sources, expected);
});

test('fQuery.fn.select() string select multi', () => {
    const x = fQuery().select('test/assets/files-abc/a, test/assets/files-abc/b');
    const sources = Array.from(x, xi => xi.source);
    const expected = [path.resolve('test/assets/files-abc/a'), path.resolve('test/assets/files-abc/b')];
    assert.deep_equal(sources, expected);
});

test('fQuery.fn.select() string select prefix', () => {
    const x = fQuery().select('test/assets/files-abc: a, b');
    const sources = Array.from(x, xi => xi.source);
    const expected = [path.resolve('test/assets/files-abc/a'), path.resolve('test/assets/files-abc/b')];
    assert.deep_equal(sources, expected);
});

test('fQuery.fn.select() only one prefix pro group allowed', () => {
    assert.throws(
        () => {
            fQuery().select('test/assets/files-abc: a, test: b');
        }
    );
});

test('fQuery.fn.select() string select groups', () => {
    const x = fQuery().select('test/assets/files-abc: a; test/assets: files-abc/b');
    const sources = Array.from(x, xi => xi.source);
    const expected = [path.resolve('test/assets/files-abc/a'), path.resolve('test/assets/files-abc/b')];
    assert.deep_equal(sources, expected);
});
