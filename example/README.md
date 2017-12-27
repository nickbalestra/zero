Zero password example
=====================

## Getting started

Install the required dependencies. From within this `./example` directory run:

```bash
$ npm install
```


### Configuration

#### SMTP

The example rely on an email delivery strategy for the token, therefore, to properly works, it requires access to an smpt server to send emails. (You can simply use your gmail account for testing.)

Simply add a `.env` file within this `./example` directory:

```bash
touch .env
```

Within that file make sure to list the following environment variables with your own values:

```text
smtpServerFrom=
smtpServerUser=
smtpServerPassword=
smtpServerHost= #for gmail should be smtp.gmail.com
smtpServerPort= #for gmail should be 465
```

#### USERS

The example implement a dummy database with a couple of users on records, make sure to have an user with a valid email address in there, so that you can test receiving the activation email. [Just add your own user/email to the records here](https://github.com/nickbalestra/zero/blob/master/example/db/index.js#L3-L6) 

### Start the example app

Simply run the following command and you should be now ready to go

```
npm start
```

## Navigating the app

### `/login`

Visit [http://localhost:3000/login](http://localhost:3000/login) submit your email in the form (should be the same email you added to the records in the dummy db) and you should be redirected to `/login/message` with a confirmation message.

### `Check your inbox`
You should have recived an email with a link, it will look something like `http://localhost:3000/?token=xxx`. Click it and you should be logged in (The app will redirect to your profile page `/profile`)

### `/profile`
Here you will be able to check your profile page. You won't be able to access this page while logged out.

### `/logout`
You will be logged out when hitting this route
