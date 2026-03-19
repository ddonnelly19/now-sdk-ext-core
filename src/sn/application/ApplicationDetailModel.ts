export class ApplicationDetailModelResponse {
    result:ApplicationInstanceDetailModel;
}

export class ApplicationInstanceDetailModel {
    app_info_on_instance:ApplicationDetailModel;
}


export class ApplicationDetailModel {

    logo:string;
    short_description:string;
    needs_app_engine_licensing:boolean;
    custom_table_count:string;
    name:string;
    vendor:string;
    vendor_prefix:string;
    link:string;
    scope:string;
    compatibilities:string;
    active:boolean;
    price_type:string;
    lob:string[];
    source:string;
   
    shared_internally:boolean;
    indicators:string[];
    display_message:string;
    upload_info:string;
    products:string[];
    install_date:string;
    update_date:string;
    version:string;
    version_display:string;
    assigned_version:string;
    latest_version:string;
    latest_version_display:string;
    demo_data:string;
    sys_id:string;
    sys_updated_on:string;
    sys_created_on:string;

    can_edit_in_studio:boolean;
    can_open_in_studio:boolean;
    is_customized_app:boolean;
    can_install_or_upgrade_customization:boolean;
    customized_version_info:unknown;
    is_store_app:boolean;
    store_link:string;

    isSubscriptionApplicable:boolean;
    publish_date_display:string;
    isAppstorePlugin:boolean;
    uninstall_blocked:boolean;
    sys_code:string;
    can_install_or_upgrade:boolean;
    isInstalled:boolean;

    isInstalledAndUpdateAvailable:boolean;
    isCustomizationUpdateAvailable:boolean;
    installed_as_dependency:boolean;
    app_schedule_details:unknown;
    dependencies:unknown;
    contains_plugins:boolean;
    optional_apps_available:boolean;
    install_tracker_id:string;
    versions:unknown[];
    new_guided_setup_id:string;
    upgradeHistoryId:string;
    upgradeDetailsInfo:unknown;
    installationInfo:unknown;
    installedFilesQuery:unknown;
    customizedFilesQuery:unknown;
    userDateFormat:string;
    time_taken:number;

    sys_created_on_display:string;
    sys_updated_on_display:string;  

    






    /* Example response JSON removed — see ServiceNow Store API docs for schema */

}


