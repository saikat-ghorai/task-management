const encodeCursor = (cursorContent) =>
    Buffer.from(JSON.stringify(cursorContent)).toString('base64');

const decodeCursor = (cursor) =>
    JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));

export { encodeCursor, decodeCursor }