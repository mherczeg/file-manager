import React, { useState, useEffect } from 'react';
import { Slider as MuiSlider, SliderProps, Tooltip } from '@material-ui/core';

interface Props extends SliderProps {
    value: number | number[],
};

const ValueLabelComponent: React.FunctionComponent<{ children: React.ReactElement, open: boolean, value: number }> = (props) => {
    const { children, open, value } = props;
    return (
        <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>{children}</Tooltip>
    );
}

export const Slider: React.FunctionComponent<Props> = (props) => {
    const [innerValue, setInnerValue] = useState<number | number[]>(props.value);
    const [dragging, setDragging] = useState<boolean>(false);

    useEffect(() => {
        if (!dragging) setInnerValue(props.value);
    }, [props.value])

    return <MuiSlider {...props}
        value={innerValue}
        valueLabelDisplay="auto"
        ValueLabelComponent={ValueLabelComponent}
        onChangeCommitted={(e, value) => { 
            setDragging(false);
            props.onChangeCommitted && props.onChangeCommitted(e, value);
        }}
        onChange={(e, value) => { 
            setDragging(true); 
            setInnerValue(value); 
            props.onChange && props.onChange(e, value);
        }}
    />
}