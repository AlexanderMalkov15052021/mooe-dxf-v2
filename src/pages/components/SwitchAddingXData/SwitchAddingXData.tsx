import { ConverterStor } from "@/entities";
import { Switch } from "antd/lib";
import { observer } from "mobx-react-lite";

const SwitchAddingXData = observer(() => {
    const {
        store: {
            addingXDataText, setWithXData
        },
    } = ConverterStor;

    const changeHandler = (checked: boolean) => setWithXData(checked);


    return <>
        <Switch onChange={changeHandler} />
        <p>{addingXDataText}</p>
    </>
});

export default SwitchAddingXData;