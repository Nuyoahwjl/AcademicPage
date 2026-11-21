<div align="center">
  <img src="./images/unproductive.gif" alt=" " width="50%">
</div>


``` 
                                  _________________
                                 /                /|
                                /                / |
                               /________________/ /|
                            ###|      ____      |//|
                           #   |     /   /|     |/.|
                          #  __|___ /   /.|     |  |_______________
                         #  /      /   //||     |  /              /|                  ___
                        #  /      /___// ||     | /              / |                 / \ \
                        # /______/!   || ||_____|/              /  |                /   \ \
                        #| . . .  !   || ||                    /  _________________/     \ \
                        #|  . .   !   || //      ________     /  /\________________  {   /  }
                        /|   .    !   ||//~~~~~~/   0000/    /  / / ______________  {   /  /
                       / |        !   |'/      /9  0000/    /  / / /             / {   /  /
                      / #\________!___|/      /9  0000/    /  / / /_____________/___  /  /
                     / #     /_____\/        /9  0000/    /  / / /_  /\_____________\/  /
                    / #                      ``^^^^^^    /   \ \ . ./ / ____________   /
                   +=#==================================/     \ \ ./ / /.  .  .  \ /  /
                   |#                                   |      \ \/ / /___________/  /
                   #                                    |_______\__/________________/
                   |                                    |               |  |  / /       
                   |                                    |               |  | / /       
                   |                                    |       ________|  |/ /________       
                   |                                    |      /_______/    \_________/\       
                   |                                    |     /        /  /           \ )       
                   |                                    |    /OO^^^^^^/  / /^^^^^^^^^OO\)       
                   |                                    |            /  / /        
                   |                                    |           /  / /
                   |                                    |          /___\/
                   | chiale                             |           oo
                   |____________________________________|
```

## Homepage visitor map

The visible official widget still collects visits and links to the statistics
dashboard. Orange hearts show distinct places in a local dashboard snapshot.
Hover or focus a marker to see its city/country labels. Visit counts are neither
stored nor displayed. Marker assets,
dimensions, outlines, and integer-pixel placement match the original widget;
places that land on the same pixel share a marker and retain all their labels.

Refresh the snapshot from the repository root with Node.js 18 or newer:

```powershell
node scripts/update-visitor-map.mjs
```

The script writes `assets/data/visitor-map.json` from the public dashboard Maps
view's internal `pins=old` endpoint. It retains only coordinates, city/country
labels and snapshot metadata. Network failures, empty responses,
and invalid coordinates preserve the previous file. If the snapshot cannot be
loaded or validated in the browser, the official widget's sample remains visible.

Locations accumulate across refreshes: new coordinates and labels are merged
with saved places, including places no longer returned by the dashboard. Visit
counts are not retained. This preserves observed history from these snapshots;
it cannot recover older places missing from the source. The internal endpoint
may change. Failed or empty responses leave the saved file intact. If there are
no additions, the file and its timestamp remain unchanged.

The existing Pages workflow also runs every Monday at 10:00 Asia/Shanghai
(`0 2 * * 1` in UTC). Scheduled and manual runs fetch new places. A successful
update commits only the JSON as `github-actions[bot]`, then builds and deploys
that exact revision in the same workflow. A scheduled run with no additions or
a failed fetch skips deployment. Push and manual runs still deploy the saved
data if the fetch fails. No personal access token or proxy is required; the
update job uses the repository's `GITHUB_TOKEN` with `contents: write`.

The schedule becomes active once the workflow is published on the default
branch. GitHub schedules can be delayed, and public-repository schedules are
disabled after 60 days without repository activity. Branch protection must allow
the workflow's data commit; a rejected push fails the job without force-pushing.
