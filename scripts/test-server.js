import { createFixture } from '../tests/fixture.js';
const { app } = createFixture();
app.listen(5000, '127.0.0.1', () => console.log('Fixture API on 127.0.0.1:5000. In-memory test data only.'));
