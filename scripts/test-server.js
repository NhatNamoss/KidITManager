import { createFixture } from '../tests/fixture.js';
const { app } = createFixture({ auth: true });
const port = Number(process.env.PORT || 5000);
app.listen(port, '127.0.0.1', () => console.log(`Fixture API on 127.0.0.1:${port}. In-memory test data only.`));
