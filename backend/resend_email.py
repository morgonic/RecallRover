# resend api email file

import os
import resend
import logging
from resend.exceptions import ResendError
from dotenv import load_dotenv
from urllib.parse import urlencode

# loading environment variables from .env file
load_dotenv()

# resend api key
resend.api_key = os.getenv('RESEND_API_KEY')
# frontend url
FRONT_URL = os.getenv('CORS_ORIGINS')

# basic config for logger
logging.basicConfig(
    format="%(levelname)s [%(asctime)s] %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# function to send recall email alert
def send_email_alert(
    email: str, 
    product_name: str | None,
    status_label: str,
    recall_title: str,
    recall_url: str,
    img_url: str | None
):
    name = product_name if (product_name != None) else 'a product you\'re watching'
    status = 'recalled' if (status_label == 'Recalled') else 'possibly recalled'
    subject = f'RECALL ALERT: {name} has been {status}!'
    image = f'<img src={img_url} alt="Recall Product Image">' if (img_url != None) else ''
    # send email parameters
    params: resend.Emails.SendParams = {
        'from': 'RecallRover <no-reply@recall-rover.com>',
        'to': email,
        'subject': subject,
        'html': f"""
            <h2>RECALL ALERT!</h2>
            <p>Our daily recall check detected that <strong>{name}</strong> has been <strong>{status}.</strong></p>
            <p>View the full recall notice here: <a href='{recall_url}'><strong>{recall_title}</strong></a></p>
            <p>This product will be labeled <strong>{status_label}</strong> in your <a href='https://recall-rover.com/watch-list'><strong>Watch List</strong></a>.</p>
            {image}
            <h3>Thank you,<br>RecallRover</h3>
            <img src='https://imglink.cc/cdn/_CYxcnEjcU.png' alt="RecallRover Logo">
        """
    }
    # send email
    try:
        sent_email = resend.Emails.send(params)
        logger.info(f'Recall alert email was sent: {sent_email}')
        return sent_email
    # catch exception
    except ResendError as error:
        logger.error(error)
        return None

# function to send reset password email
def send_reset_password_email(email: str, token: str):
    # reset password link with token
    token_param = urlencode({'token': token})
    reset_link = f'{FRONT_URL}/reset-password?{token_param}'
    # if no token, link will not work, return none
    if (token_param == None):
        logger.error('Reset password token was invalid. Did not send email.')
        return None
    # email params with html body
    params: resend.Emails.SendParams = {
        'from': 'RecallRover <no-reply@recall-rover.com>',
        'to': email,
        'subject': 'Reset Password for RecallRover',
        'html': f"""
            <h2>Reset Password Request</h2>
            <p>Click the link below to reset your password for <strong>RecallRover</strong>.</p>
            <p>If you did not request a password reset, ignore this email.</p>
            <p><a href='{reset_link}'><strong>Reset Password Link</strong></a></p>
            <h3>Thank you,<br>RecallRover</h3>
            <img src='https://imglink.cc/cdn/_CYxcnEjcU.png' alt="RecallRover Logo" width='193' height='200'>
        """
    }
    # send email
    try:
        sent_email = resend.Emails.send(params)
        logger.info(f'Reset password email was sent: {sent_email}')
        return sent_email
    # catch exception
    except ResendError as error:
        logger.error(error)
        return None

# for testing
if __name__ == '__main__':
    # test email recipient
    to_email = os.getenv('TO_EMAIL')

    # send test email with test data containing all fields
    send_email_alert(
        email=to_email,
        product_name='DR Power Equipment Pilot and Premier Trimmer Mowers',
        status_label='Recalled',
        recall_title='DR Power Equipment Recalls Pilot and Premier Trimmer Mowers Due to Risk of Serious Injury or Death from Fire and Burn Hazards',
        recall_url='https://www.cpsc.gov/Recalls/2027/DR-Power-Equipment-Recalls-Pilot-and-Premier-Trimmer-Mowers-Due-to-Risk-of-Serious-Injury-or-Death-from-Fire-and-Burn-Hazards',
        img_url='https://www.cpsc.gov/s3fs-public/DR1.png'
    )