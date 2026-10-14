# resend api email file

import os
import resend
from resend.exceptions import ResendError
from dotenv import load_dotenv

# loading environment variables from .env file
load_dotenv()

# resend api key
resend.api_key = os.getenv('RESEND_API_KEY')
# test email recipient
to_email = os.getenv('TO_EMAIL')

# send email parameters
params: resend.Emails.SendParams = {
    'from': 'RecallRover <no-reply@recall-rover.com>',
    'to': [f'{to_email}'],
    'subject': 'Test Email',
    'html': '<strong>This is a test.</strong>'
}

if __name__ == '__main__':
    try:
        email = resend.Emails.send(params)
        print(email)
    except ResendError as error:
        print(error)