const { paymentReminder, upgradeSubscriptionCronFn } = require('../utils/paymentReminder')
const { targetDateReminder } = require('../utils/salesTargetDateReminder')
const { searchLead } = require('./proUsers.controller')

module.exports.job = async (req, res) => {
    const result = {};
    result.paymentReminder = await paymentReminder();
    result.subscriptionUpgrade = await upgradeSubscriptionCronFn()
    result.targetDateReminder = await targetDateReminder()
    result.searchLead = await searchLead();
    res.send(result);
};