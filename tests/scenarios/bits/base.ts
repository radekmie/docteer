import faker from 'faker';

import { browserClose, browserOpen, load, resize } from '../../actions';
import { DAG } from '../../helpers';

export default DAG.create()
  .with(() => ({
    user: {
      email: faker.internet.email(),
      password: faker.internet.password(),
    },
  }))
  .with(browserOpen)
  .dead(browserClose)
  .next(resize, [1024, 768])
  .next(load, ['/']);
