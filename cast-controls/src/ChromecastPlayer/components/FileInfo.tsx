import React from 'react';
import { Grid, styled, Typography } from '@material-ui/core';
import { Wallpaper } from '@material-ui/icons';

export interface FileInfoProps {
    coverImage?: string,
    title: string,
    deviceName: string,
}

const CoverImage = styled(`img`)({
    maxWidth: '100%',
    height: '100px',
    marginBottom: '10px',
    marginRight: '10px'
});

const PlaceholderBackground = styled(`div`)({
    width: '70px',
    height: '100px',
    marginBottom: '10px',
    marginRight: '10px',
    backgroundColor: 'lightgrey',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

const CoverPlaceHolder = () => {
    return <PlaceholderBackground><Wallpaper /></PlaceholderBackground>;
}

const FileInfo: React.FunctionComponent<FileInfoProps> = ({ coverImage, title, deviceName }) => {
    return <Grid container>
        <Grid item>
            {coverImage ? <CoverImage src={coverImage} /> : <CoverPlaceHolder />}
        </Grid>
        <Grid item xs={9}>
            <Typography component="h5" variant="h5">
                {title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
                {deviceName}
            </Typography>
        </Grid>
    </Grid>
}

FileInfo.defaultProps = {
    coverImage: '', // TODO default image
}

export default FileInfo;