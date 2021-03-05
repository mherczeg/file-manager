import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { Slider } from '../commonComponents/Slider';

export interface SeekerProps {
    currentTime: number,
    duration: number,
    disabled: boolean,
    sliderChange?: (value: number | number[]) => any
}

const padTimeSegment = (segment: string) => segment.length === 1 ? `0${segment}`: segment;

const formatTime = (seconds: number, segmentCount: number = 2) => {
    const minutes = Math.floor(seconds/60);
    const hours = Math.floor(minutes/60);
    const segments = [
        Math.floor(minutes%60),
        Math.floor(seconds%60),
    ];

    if (minutes > 59 || segmentCount > 2) {
        segments.unshift(hours);
    }
    
    return segments.map((segment) => padTimeSegment(String(segment))).join(':');
};

const FileInfo: React.FunctionComponent<SeekerProps> = ({ currentTime, duration, sliderChange, disabled }) => {
    const [formattedDuration, setFormattedDuration] = useState<string>('00:00');
    const [formattedCurrentTime, setFormattedCurrentTime] = useState<string>('00:00');
    const [timeSegmentCount, setTimeSegmentCount] = useState<number>(2);

    useEffect(() => {
        const formattedDuration = formatTime(duration);
        setFormattedDuration(formattedDuration);
        setTimeSegmentCount(formattedDuration.split(':').length);
    }, [duration]);

    useEffect(() => {
        setFormattedCurrentTime(formatTime(currentTime,timeSegmentCount));
    }, [currentTime, timeSegmentCount]);

    return <Grid container spacing={2}>
        <Grid item>
            {formattedCurrentTime}
        </Grid>
        <Grid item xs>
            <Slider disabled={disabled}
                min={0}
                max={duration}
                step={1}
                value={currentTime}
                valueLabelFormat={(labelValue) => formatTime(labelValue, timeSegmentCount)}
                onChangeCommitted={(e, value) => { sliderChange && sliderChange(value); }}/>
        </Grid>
        <Grid item>
            {formattedDuration}
        </Grid>
    </Grid>
}

FileInfo.defaultProps = {
    sliderChange: () => { },
}

export default FileInfo;
