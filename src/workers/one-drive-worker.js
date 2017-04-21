import winston from 'winston';
import oneDriveAPI from 'onedrive-api';
import config from '../config/env';

const client = config.monqClient;
const worker = client.worker(['oneDrive']);
const accessToken = 'EwDoAq1DBAAUGCCXc8wU/zFu9QnLdZXy+YnElFkAAVzoNbaUKxDes4iD/FTYeJu8vK6meJBf6ZDL7s5tJ3ZsJ4aB1BDxDj8Ab6EdI0pAB19H78MUJTRjmBrIjkiuiYl+zehcqFDnKMie76G70n8vGCd2KbYU/SaUJpiM2WRVQh9PyeC6nH8SgZQkTU4eSTAWA6a5RqCHdmUm1WdrlEipd0WMXFTPL2DtpSqBGYtUoyi7+AJejn2QFgds7x7lHjvoyjwrVQdBJuWmtKhMyy1BAmcfaKR+DU9462dYO9sU4Y+Talg2WvuVuQlkK9JHh/tlo6W6gAT0KXLPCgMlWYcoIBFgoRJisRxGoRIi2qvr24idrwsqxeDn/PT02yYqFQ8DZgAACB8Y8O7WAIRNuAHgY1zT+ncQmtqHatHDgICHK17WT2U8jwC/UTmB6lVyuQpP2k4i+ETDRLtNjfvPGDZoAX2DLi+SZlW0wjYvIetiJo4cYm0cqLrX7WjOhu4EGewWJ8nk8hPT/zxbrjXATwr1XQBHSamukyS/ttLcSapzlJeSg4FeghH2iG0l3FLX/bLkJvRPu9jxHeExrCU76ZOLznOPZcJQWkhTPy8GNYQtNpeHFduhAWvkUX4lMTkkQEz3zbGn0yYK1tZ6AG4tOr47eM5YvKr+zPd8bdQVyHYXj5Tam3GcNpNo+uh8BtjIsQ2TCmhdAMLhDFUXUtT+21NYtW8W/gMi8gH3C2JKYM61GJN5rJZuduWQ+V4ZGXi8/geLcW9xBUT1EZPHVoR1L0xqMJQHaqDcgrK221yiIHleLgyvXGIwODJwjVqXwzxvyME1vgkTX9PwPJ4Hwo/av4k8EwzX1MlOpkQas7yT7MhXZOvZ2Nao2Shq8fDxKFGytPtgpvDOcCMLBH1zbr60w4pCcSJS2pz/bkgPqNaf0GIs5Gq/bGWA4PmlrgwjQ+8GR5uIqcapsNVJKbrf44aHmlX+1y5NrYkZAvAB';

worker.register({ download: (data, next) => {
  winston.info('start download');
  oneDriveAPI.items.listChildren({ accessToken })
  .then((res) => {
    res.value.forEach((entry) => {
      winston.info(`file:${entry.name} id:${entry.id}`);
      next();
    });
  })
  .catch((err) => {
    winston.info(err);
    next(err);
  });
}
});

worker.on('dequeued', (data) => {
  winston.info(`Dequeued:${data}`);
});

worker.on('failed', (data) => {
  winston.info(`Failed:${data}`);
});

worker.on('complete', (data) => {
  winston.info(`Complete:${data}`);
});

worker.on('error', () => {
  worker.stop();
});

worker.start();
