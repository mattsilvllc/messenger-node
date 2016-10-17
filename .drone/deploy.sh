set -e
echo "installing deps"
npm install
echo "switching directories"
cd ../deploy
echo "Deploying revision: $(git rev-parse master) $(date)"
ansible-playbook deploy.yml -i ./AWSInventory.js --extra-vars=@settings.json -v
