# apscheduler

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from daily_check import run_daily_check
import asyncio

# define job defaults to coalesce missed executions, only allow 1 instance
job_defaults = {
    'coalesce': True,
    'max_instances': 1
}
# build scheduler with EST timezone and job defaults
scheduler = AsyncIOScheduler(timezone='America/New_York', job_defaults=job_defaults)
# add run_daily_check as the job to run at 60 second intervals for testing
scheduler.add_job(run_daily_check, 'interval', seconds=60, id='daily_check')

# function to start the scheduler
async def start_scheduler():
    scheduler.start()

# function to shut down the scheduler
async def stop_scheduler():
    scheduler.shutdown()

# function to run the scheduler
async def run_scheduler():
    await start_scheduler()
    while True:
        await asyncio.sleep(60)


# for testing
if __name__ == '__main__':
    try:
        asyncio.run(run_scheduler())
    except (KeyboardInterrupt, SystemExit):
        pass