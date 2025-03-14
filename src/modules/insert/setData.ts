import { fontSize, scaleCorrection } from "@/constants";
import { laneMark, MooeDoc } from "@/types";
import { DxfWriter, point3d } from "@tarikjabiri/dxf";
import { getRoads } from "../extract/getRoads";
import { getDXFLine, getPoints, getPointsLine, getStraightLines } from "@/helpers/get";
import { addDXFText, addLayers } from "@/helpers/add";
import { setRectangle } from "@/helpers/set";

export const setData = (dxf: DxfWriter, mooe: MooeDoc, isInsertingXData: boolean) => {

    const pointslist = getPointsLine(mooe);

    const points = getPoints(mooe);

    const roads = getRoads(mooe, points, pointslist);

    const straightLines = getStraightLines(mooe, roads);

    const allTargetPoints = points.targetPoints;

    const baseTargetPoints = [
        ...points.targetChargePoints,
        ...points.targetPalletPoints,
        ...points.targetRestPoints,
        ...points.turningChargePoints,
        ...points.turningPalletPoints,
        ...points.turningRestPoints
    ];

    const otherTargetPoints = allTargetPoints.filter(obj => !baseTargetPoints.includes(obj));

    addLayers(dxf);

    setRectangle(dxf, mooe);

    straightLines?.map((obj: any) => {

        const startId = obj.mLanes[0].mStartPos;
        const endId = obj.mLanes[0].mEndPos;

        const dir = obj.mLanes[0].mDirection;

        const line = getDXFLine(dxf, dir, startId, endId, pointslist);

        if (isInsertingXData) {
            const appId = dxf.tables.addAppId(`Line - ${line.handle}`);

            const xData = line.addXData(appId.name);

            xData.string(
                `fixed id: road ${line.handle} ${obj.mRoadID} ${obj.mLanes[0].mLaneID} ${obj.mLanes[0].mStartPos} ${obj.mLanes[0].mEndPos} `
            );
        }

    });

    roads?.palletRoads?.map((obj: any) => {

        const startId = obj.road.mLanes[0].mStartPos;
        const endId = obj.road.mLanes[0].mEndPos;

        const line = dxf.addLine(
            point3d(pointslist[startId].mLaneMarkXYZW.x / scaleCorrection, pointslist[startId].mLaneMarkXYZW.y / scaleCorrection),
            point3d(pointslist[endId].mLaneMarkXYZW.x / scaleCorrection, pointslist[endId].mLaneMarkXYZW.y / scaleCorrection),
            { layerName: "Pallet roads" }
        );
        if (isInsertingXData) {
            const appId = dxf.tables.addAppId(`Line - ${line.handle}`);

            const xData = line.addXData(appId.name);

            xData.string(
                `fixed id: road ${line.handle} ${obj.road.mRoadID} ${obj.road.mLanes[0].mLaneID} ${obj.road.mLanes[0].mStartPos} ${obj.road.mLanes[0].mEndPos} `
            );
        }

    });

    roads?.restRoads?.map((obj: any) => {

        const startId = obj.road.mLanes[0].mStartPos;
        const endId = obj.road.mLanes[0].mEndPos;

        const line = dxf.addLine(
            point3d(pointslist[startId].mLaneMarkXYZW.x / scaleCorrection, pointslist[startId].mLaneMarkXYZW.y / scaleCorrection),
            point3d(pointslist[endId].mLaneMarkXYZW.x / scaleCorrection, pointslist[endId].mLaneMarkXYZW.y / scaleCorrection),
            { layerName: "Rest roads" }
        );
        if (isInsertingXData) {
            const appId = dxf.tables.addAppId(`Line - ${line.handle}`);

            const xData = line.addXData(appId.name);

            xData.string(
                `fixed id: road ${line.handle} ${obj.road.mRoadID} ${obj.road.mLanes[0].mLaneID} ${obj.road.mLanes[0].mStartPos} ${obj.road.mLanes[0].mEndPos} `
            );
        }

    });

    roads?.chargeRoads?.map((obj: any) => {

        const startId = obj.road.mLanes[0].mStartPos;
        const endId = obj.road.mLanes[0].mEndPos;

        const line = dxf.addLine(
            point3d(pointslist[startId].mLaneMarkXYZW.x / scaleCorrection, pointslist[startId].mLaneMarkXYZW.y / scaleCorrection),
            point3d(pointslist[endId].mLaneMarkXYZW.x / scaleCorrection, pointslist[endId].mLaneMarkXYZW.y / scaleCorrection),
            { layerName: "Charge roads" }
        );
        if (isInsertingXData) {
            const appId = dxf.tables.addAppId(`Line - ${line.handle}`);

            const xData = line.addXData(appId.name);

            xData.string(`fixed id: road ${line.handle} ${obj.road.mRoadID} ${obj.road.mLanes[0].mLaneID} ${obj.road.mLanes[0].mStartPos} ${obj.road.mLanes[0].mEndPos} `);
        }

    });

    // set points

    // set alley points
    points?.palletPoints?.map((point: laneMark) => addDXFText(dxf, "Pallet points", point, isInsertingXData));
    points?.targetPalletPoints?.map((point: laneMark) => addDXFText(dxf, "Target pallet points", point, isInsertingXData));
    points?.turningPalletPoints?.map((point: laneMark) => addDXFText(dxf, "Turning pallet points", point, isInsertingXData));
    points?.cachePalletPoints?.map((point: laneMark) => addDXFText(dxf, "Cache pallet points", point, isInsertingXData));

    // set rest points
    points?.restPoints?.map((rest: laneMark) => addDXFText(dxf, "Rest points", rest, isInsertingXData));
    points?.targetRestPoints?.map((point: laneMark) => addDXFText(dxf, "Target rest points", point, isInsertingXData));
    points?.turningRestPoints?.map((point: laneMark) => addDXFText(dxf, "Turning rest points", point, isInsertingXData));

    // set charge points
    points?.chargePoints?.map((rest: laneMark) => addDXFText(dxf, "Charge points", rest, isInsertingXData));
    points?.targetChargePoints?.map((point: laneMark) => addDXFText(dxf, "Target charge points", point, isInsertingXData));
    points?.turningChargePoints?.map((point: laneMark) => addDXFText(dxf, "Turning charge points", point, isInsertingXData));

    // set othe target points
    otherTargetPoints?.map((point: laneMark) => addDXFText(dxf, "Othe target points", point, isInsertingXData));

    points?.locationPoints?.map((obj: any, index: number) => {

        const name = index < 9 ? `Test poin - 0${index + 1}` : `Test poin - ${index + 1}`

        dxf.addMText(
            { x: obj.mLaneMarkXYZW.x / scaleCorrection, y: obj.mLaneMarkXYZW.y / scaleCorrection, z: 0 },
            fontSize,
            name,
            { layerName: "Target points" }
        );
    });

    return dxf;
}