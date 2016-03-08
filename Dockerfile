FROM node:5.7.1-onbuild
EXPOSE 3000
ENV WORKERS 5

RUN \
  useradd -ms /bin/false app_user && \
  chown -R app_user:app_user /usr/src/app

RUN npm install -g pm2

CMD pm2 -v && pm2 start -i $WORKERS --no-daemon --user app_user proxy.js -- --config /conf/config.json
