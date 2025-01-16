import { MooeDoc } from "@/types";
import { makeAutoObservable } from "mobx";

class ConverterStor {
    isLoading: boolean = false;
    refFileName: string | null = null;
    loadingTime: number[] = [0, 0];
    isMessageShow: boolean = false;
    href: string = "";
    doc: any = null;

    mooeDoc: MooeDoc = null;

    duplicateIds: number[] = [];

    duplicateObjects: { name: string, id: number, coords?: { w: number; x: number; y: number; z: number; } }[] = [];
    duplicateObjectsGroup: Record<number, { name: string, id: number, coords?: { w: number; x: number; y: number; z: number; } }[]> = {};

    modalIdsState: boolean = false;


    constructor() {
        makeAutoObservable(this);
    }


    setLoadingTime = (val: number[]) => this.loadingTime = val;
    setIsMessageShow = (val: boolean) => this.isMessageShow = val;
    setRefFileName = (val: string | null) => this.refFileName = val;
    setIsLoading = (val: boolean) => this.isLoading = val;

    setHref = (doc: any) => {

        const file = new Blob([doc as unknown as string], { type: 'application/dxf' });
        const url = URL.createObjectURL(file);

        this.href = url;
    }

    checkMooeDoc = (doc: MooeDoc) => {

        const Ids: number[] = [];

        doc?.mLaneMarks.map(poin => {
            Ids.push(poin.mLaneMarkID);
        });

        doc?.mRoads.map(road => {
            Ids.push(road.mRoadID);
        });

        doc?.mRoads.map(road => {
            Ids.push(road.mLanes[0].mLaneID);
        });

        this.duplicateIds = Ids.filter((number, index, numbers) => {
            return numbers.indexOf(number) !== index;
        });

        if (this.duplicateIds.length) {

            doc?.mLaneMarks.map(poin => {
                if (this.duplicateIds.includes(poin.mLaneMarkID)) {
                    this.duplicateObjects.push({ name: poin.mLaneMarkName, id: poin.mLaneMarkID, coords: poin.mLaneMarkXYZW });
                }
            });

            doc?.mRoads.map(road => {
                Ids.push(road.mRoadID);
                if (this.duplicateIds.includes(road.mRoadID)) {
                    this.duplicateObjects.push({ name: road.mRoadName, id: road.mRoadID });
                }
            });

            doc?.mRoads.map(road => {
                Ids.push(road.mLanes[0].mLaneID);
                if (this.duplicateIds.includes(road.mLanes[0].mLaneID)) {
                    this.duplicateObjects.push({ name: road.mLanes[0].mLaneName, id: road.mLanes[0].mLaneID });
                }
            });

            this.duplicateObjects.map((obj: { name: string, id: number, coords?: { w: number; x: number; y: number; z: number; } }) => {

                if (this.duplicateObjectsGroup.hasOwnProperty(obj.id)) {
                    this.duplicateObjectsGroup[obj.id].push(obj);
                }
                else {
                    this.duplicateObjectsGroup = { ...this.duplicateObjectsGroup, [obj.id]: [obj] };
                }

            });

            this.modalIdsState = true;
        }

    }

    setModalIdsState = (state: boolean) => {
        this.modalIdsState = state;
    }

    setDoc = (doc: any) => {
        this.doc = doc;

        this.setHref(doc);
    }
}

export const store = new ConverterStor();
