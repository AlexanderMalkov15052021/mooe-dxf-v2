import { ConverterStor } from "@/entities";
import { observer } from "mobx-react-lite";
import { ChangeEvent, FormEvent, useRef } from "react";
import { DxfWriter } from "@tarikjabiri/dxf";
import { setData } from "@/modules/insert/setData";
import { getSplines } from "@/modules/create/getSplines";
import { laneMark } from "@/types";
import { getNewCoordsWhenTurning } from "@/helpers/math";

const UploadForm = observer(() => {

    const {
        store: {
            isLoading, refFileName, isInsertingXData, setIsMessageShow, setIsLoading, setLoadingTime,
            setRefFileName, setDoc, checkMooeDoc
        },
    } = ConverterStor;

    const refTime = useRef([0, 0]);

    const readFile = (evt: ChangeEvent<HTMLInputElement>) => {

        if (!evt.target.files) return;

        if (evt.target.files[0].name.split(".").at(-1) !== "mooe") {
            setIsMessageShow(true);
            return
        };

        setIsLoading(true);

        const file = evt.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);

        setRefFileName(file.name);

        reader.onload = async () => {

            const interval = setInterval(() => {

                if (refTime.current[1] === 59) {
                    setLoadingTime([refTime.current[0] + 1, 0]);
                    refTime.current[0] += 1;
                    refTime.current[1] = 0;
                }
                else {
                    setLoadingTime([refTime.current[0], refTime.current[1] + 1]);
                    refTime.current[1] += 1;
                }

            }, 1000);

            try {
                const dxf = new DxfWriter();

                const fileStr = reader.result as string;

                const mooeJson = JSON.parse(fileStr);

                checkMooeDoc(mooeJson)

                /* 🔻 Transform points 🔻 */

                if (false) {

                    const shiftX = -1.5 * -1;
                    const shiftY = 1.5 * -1;

                    const angle = 0.01 * -1;

                    const getNewCoordsBezierWhenTurning = (x: number, y: number, angle: number) => {
                        const newX = Math.cos(angle) * x - Math.sin(angle) * -y;
                        const newY = Math.sin(angle) * x + Math.cos(angle) * -y;

                        return { x: newX, y: newY * -1 }
                    }

                    mooeJson.mLaneMarks.map((obj: laneMark) => {
                        obj.mLaneMarkXYZW.x += shiftX;
                        obj.mLaneMarkXYZW.y += shiftY;

                        const coords = getNewCoordsWhenTurning(
                            obj.mLaneMarkXYZW.x,
                            obj.mLaneMarkXYZW.y,
                            angle
                        );

                        obj.mLaneMarkXYZW.x = coords.x;
                        obj.mLaneMarkXYZW.y = coords.y;

                    });

                    mooeJson.mRoads.map((obj: any) => {

                        if (obj.mLanes[0].mLaneType === 3) {
                            obj.mLanes[0].mArcControl.x += shiftX;
                            obj.mLanes[0].mArcControl.y += shiftY;

                            const coords = getNewCoordsWhenTurning(
                                obj.mLanes[0].mArcControl.x,
                                obj.mLanes[0].mArcControl.y,
                                angle
                            );

                            obj.mLanes[0].mArcControl.x = coords.x;
                            obj.mLanes[0].mArcControl.y = coords.y;
                        }

                        if (obj.mLanes[0].mLaneType === 2) {

                            obj.mLanes[0].m_BezierControl1.x += shiftX * 50;
                            obj.mLanes[0].m_BezierControl1.y += -shiftY * 50;

                            obj.mLanes[0].m_BezierControl2.x += shiftX * 50;
                            obj.mLanes[0].m_BezierControl2.y += -shiftY * 50;


                            const coords1 = getNewCoordsBezierWhenTurning(
                                obj.mLanes[0].m_BezierControl1.x,
                                obj.mLanes[0].m_BezierControl1.y,
                                angle
                            );

                            obj.mLanes[0].m_BezierControl1.x = coords1.x;
                            obj.mLanes[0].m_BezierControl1.y = coords1.y;


                            const coords2 = getNewCoordsBezierWhenTurning(
                                obj.mLanes[0].m_BezierControl2.x,
                                obj.mLanes[0].m_BezierControl2.y,
                                angle
                            );

                            obj.mLanes[0].m_BezierControl2.x = coords2.x;
                            obj.mLanes[0].m_BezierControl2.y = coords2.y;

                        }

                        if (obj.mLanes[0].mLaneType === 1) {
                            obj.mLanes[0].mBezierControl.x += shiftX;
                            obj.mLanes[0].mBezierControl.y += shiftY;

                            const coords = getNewCoordsWhenTurning(
                                obj.mLanes[0].mBezierControl.x,
                                obj.mLanes[0].mBezierControl.y,
                                angle
                            );

                            obj.mLanes[0].mBezierControl.x = coords.x;
                            obj.mLanes[0].mBezierControl.y = coords.y;
                        }

                    });

                    console.log("New mooe: ", mooeJson);

                }

                /* 🔺 Transform points 🔺 */

                const newDXF = setData(dxf, mooeJson, isInsertingXData);

                const splines = getSplines(mooeJson, newDXF, isInsertingXData);

                const dxfString = newDXF.stringify();

                const targetStr = dxfString.replace("ENTITIES\n0", `${splines}`);

                setDoc(targetStr);

                setIsLoading(false);

                clearInterval(interval);

            } catch (err: any) {
                return console.error(err.stack);
            }

        };

        reader.onerror = () => {
            console.error(reader.error);
        };

    }

    const restFiles = (evt: FormEvent<HTMLFormElement>) => {
        setIsMessageShow(false);
        evt.currentTarget.reset();
        setRefFileName(null);
        setLoadingTime([0, 0]);
    }


    return <>
        <form onClick={isLoading ? evt => evt.preventDefault() : restFiles}>
            <label htmlFor="file-upload" className={isLoading ? "disabledUpload custom-file-upload" : "custom-file-upload"}>
                {refFileName ? refFileName : "Выберите файл .mooe"}
            </label>
            <input id="file-upload" type="file" onChange={isLoading ? evt => evt.preventDefault() : readFile} />
        </form>
    </>
});

export default UploadForm;