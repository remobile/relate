import expect from 'expect';

import Link from '../../lib/store/link';

describe('Link', () => {
  const link = new Link('a');
  const arraylink = new Link(['a', 'b']);

  it('Stores data received from argument', () => {
    expect(link.nodes).toEqual('a');
    expect(arraylink.nodes).toEqual(['a', 'b']);
  });

  it('Gets data received', () => {
    expect(link.get()).toEqual('a');
    expect(arraylink.get()).toEqual(['a', 'b']);
  });
});
