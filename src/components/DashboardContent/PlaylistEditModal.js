import React, {useEffect, useState} from "react"
import ReactModal from "react-modal"
import styles from "../../assets/modal.module.sass"
import {faExclamationCircle, faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons"
import IconPillButton from "../Minor/IconPillButton"
import {BACKEND_URL} from "../../constants"
import {connect} from "react-redux"
import {useHistory} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {renamePlaylist} from "../../redux/actions"

const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}


export default connect(mapStateToProps)(function PlaylistEditModal(props) {
    let [isOpened, setOpened] = useState(false)
    let [playlistName, setPlaylistName] = useState(props.name)
    let [currentlyLoadingRename, setCurrentlyLoadingRename] = useState(false)
    let [currentlyLoadingDelete, setCurrentlyLoadingDelete] = useState(false)
    const history = useHistory()

    useEffect(() => {
        if(props.showModal !== isOpened) {
            setOpened(props.showModal)
        }
    }, [isOpened, props.showModal])

    useEffect(() => {
        setPlaylistName(props.name)
    }, [props.name])

    const handleRenamePlaylist = () => {
        setCurrentlyLoadingRename(true)
        props.dispatch(renamePlaylist(props.playlistID, playlistName))
        fetch(BACKEND_URL + "/renamePlaylist?token=" + props.accessToken + "&playlist=" + props.playlistID + "&newName=" + playlistName).then(res => res.json())
            .then(res => {
                if (res.hasOwnProperty("status") && res.status === "OK") {
                    props.onClose()
                    setCurrentlyLoadingRename(false)
                } else {
                    alert("Couldn't complete the action, please check log.")
                    setCurrentlyLoadingRename(false)
                    console.log(res)
                }
            }).catch(err => {
                setCurrentlyLoadingRename(false)
                alert("Couldn't complete the action, please check log.")
                console.log(err)
            })
    }

    const deletePlaylist = () => {
        setCurrentlyLoadingDelete(true)
        fetch(BACKEND_URL + "/deletePlaylist?token=" + props.accessToken + "&playlist=" + props.playlistID).then(res => res.json())
            .then(res => {
                if(res.hasOwnProperty("status") && res.status === "OK") {
                    setCurrentlyLoadingDelete(false)
                    props.onClose()
                    history.push("/app")
                } else {
                    setCurrentlyLoadingDelete(false)
                    alert("Couldn't complete the action, please check log.")
                    console.log(res)
                }
            }).catch(err => {
                setCurrentlyLoadingDelete(false)
                alert("Couldn't complete the action, please check log.")
                console.log(err)
            })
    }

    return(
        <div>
            <ReactModal
                isOpen={isOpened}
                contentLabel={"Edit"}
                onRequestClose={props.onClose}
                className={styles.modal}
                overlayClassName={styles.modalOverlay}
            >
                <h2>Edit</h2>
                <div className={styles.form} style={{marginBottom: 20}}>
                    <input className={styles.search} type="text" value={playlistName} onChange={e => setPlaylistName(e.target.value)}/>
                    <IconPillButton disabled={props.name === playlistName || playlistName === ""} onclick={handleRenamePlaylist} icon={faPencilAlt} text={"Rename"} inverted={true} loading={currentlyLoadingRename}/>
                </div>

                { playlistName === "" &&
                    <div className={styles.warningWrapper}>
                        <FontAwesomeIcon className={styles.warningIcon} icon={faExclamationCircle} size="1x"/> <p>The playlist name is invalid.</p>
                    </div>
                }
                <IconPillButton onclick={deletePlaylist} icon={faTrash} text={"Delete"} inverted={false} loading={currentlyLoadingDelete}/>

            </ReactModal>
        </div>
    )
})