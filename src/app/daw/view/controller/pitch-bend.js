'use strict';

var $ = require( "jquery" ),
	settingsConvertor = require( "settings-convertor" );

module.exports = function( mod ) {

	mod.controller( "PitchBendCtrl", [ "$scope", "$timeout", "dawEngine", function( $scope, $timeout, dawEngine ) {
		var self = this,
			settingsChangeHandler = function() {
				dawEngine.pitchSettings = {
					bend: settingsConvertor.getNormalPitch( self.bend )
				};
			},
			settings = dawEngine.pitchSettings,
			$pitchBend = $( ".pitch-bend webaudio-slider" );

		self.RANGE = 128;
		self.bend = settingsConvertor.getSimplePitch( settings.bend );

		[
			"pitch.bend"
		].forEach( function( path ) {
			$scope.$watch( path, settingsChangeHandler );
		} );

		dawEngine.addExternalMidiMessageHandler( function( type, parsed, rawEvent ) {
			if ( type === "pitchBend" ) {
				$pitchBend[ 0 ].setValue( settingsConvertor.getSimplePitch( parsed.pitchBend ) );
			}
		} );

		// fix issue with initial value settings
		$timeout( function() {
			$pitchBend[ 0 ].setValue( self.bend );
		}, 500 );

		// fix the lack of attr 'value' update
		$pitchBend.on( "change", function( e ) {
			if ( parseFloat( $( e.target ).attr( "value" ) ) !== e.target.value ) {
				$( e.target ).attr( "value", e.target.value );
			}
		} );

		// handle pitch return to center
		var isPitchBending = false;
		$( "body" ).on( "mouseup", function() {
			if ( isPitchBending ) {
				isPitchBending = false;
				self.bend = self.RANGE / 2;
				$pitchBend[ 0 ].setValue( self.bend );
				settingsChangeHandler();
			}
		} );
		$pitchBend.on( "mousedown", function() {
			isPitchBending = true;
		} );

	} ] );

	mod.directive( "pitchBend", [ "$templateCache", function( $templateCache ) {
		return {
			restrict: "E",
			replace: true,
			template: $templateCache.get( "pitch-bend.html" )
		};
	} ] );

};