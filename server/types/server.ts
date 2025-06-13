import { app } from '../../src/app';

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
