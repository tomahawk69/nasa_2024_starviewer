import * as THREE from 'three';
import project3d from '@frostoven/alkalurops/project3d.js';
import * as FS from 'fs'

const data = JSON.parse(FS.readFileSync('test_recalculated.json', 'utf8'));
const result = [];
for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const new_row = {}
    const id = row['n'].split(' ')
    new_row['n'] = id[2]
    new_row['s'] = `${id[0]} ${id[1]}`
    new_row['p'] = row['p']


    const { x, y, z } = project3d({
        rightAscension: row['additional_data']['ra'],
        declination: row['additional_data']['dec'],
        distance: row['p'],
    });
    new_row['x'] = x;
    new_row['y'] = y;
    new_row['z'] = z;
    new_row['p'] = row['p'];
    new_row['K'] = row['K'];
    new_row['N'] = row['N'];
    result.push(new_row);

}
FS.writeFileSync('alpha-cent-b-min.json', JSON.stringify(result));