FROM node:5.7.1-onbuild

RUN useradd -ms /bin/false app_user
RUN chown -R app_user:app_user /usr/src/app
